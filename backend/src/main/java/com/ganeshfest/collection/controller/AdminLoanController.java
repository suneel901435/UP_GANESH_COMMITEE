package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.dto.LoanSummaryDto;
import com.ganeshfest.collection.dto.RepaymentRequest;
import com.ganeshfest.collection.entity.Loan;
import com.ganeshfest.collection.entity.LoanRepayment;
import com.ganeshfest.collection.enums.LoanStatus;
import com.ganeshfest.collection.repository.LoanRepaymentRepository;
import com.ganeshfest.collection.repository.LoanRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Village lending (vaddi) - admin-only. Deliberately NOT exposed on any public
 * endpoint: who owes the committee money, and how much, is between the
 * committee and the borrower, unlike collections/expenses which the public
 * dashboard already shows in aggregate (see PublicController#dashboard).
 */
@RestController
@RequestMapping("/api/admin/loans")
public class AdminLoanController {

    private final LoanRepository loanRepo;
    private final LoanRepaymentRepository repaymentRepo;

    public AdminLoanController(LoanRepository loanRepo, LoanRepaymentRepository repaymentRepo) {
        this.loanRepo = loanRepo;
        this.repaymentRepo = repaymentRepo;
    }

    public static class LoanRequest {
        public String borrowerName;
        public String borrowerContact;
        public BigDecimal principalAmount;
        public BigDecimal interestRatePercent; // e.g. 2.00 = ₹2 per ₹100
        public String interestPeriodNote;      // e.g. "per month"
        public String loanDate;                // ISO date
        public String notes;
    }

    @GetMapping
    public List<LoanSummaryDto> listAll() {
        return loanRepo.findByOrderByLoanDateDesc().stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public LoanSummaryDto detail(@PathVariable Long id) {
        Loan loan = loanRepo.findById(id).orElseThrow(() -> new RuntimeException("Loan not found"));
        return toSummary(loan);
    }

    @GetMapping("/{id}/repayments")
    public List<LoanRepayment> repayments(@PathVariable Long id) {
        return repaymentRepo.findByLoanIdOrderByPaymentDateDesc(id);
    }

    @PostMapping
    public ResponseEntity<LoanSummaryDto> create(@RequestBody LoanRequest req, Authentication auth) {
        Loan loan = Loan.builder()
                .borrowerName(req.borrowerName)
                .borrowerContact(req.borrowerContact)
                .principalAmount(req.principalAmount)
                .interestRatePercent(req.interestRatePercent != null ? req.interestRatePercent : new BigDecimal("2.00"))
                .interestPeriodNote(req.interestPeriodNote)
                .loanDate(LocalDate.parse(req.loanDate))
                .status(LoanStatus.ACTIVE)
                .notes(req.notes)
                .createdBy(auth != null ? auth.getName() : "admin")
                .build();
        loan = loanRepo.save(loan);
        return ResponseEntity.ok(toSummary(loan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoanSummaryDto> update(@PathVariable Long id, @RequestBody LoanRequest req) {
        Loan loan = loanRepo.findById(id).orElseThrow(() -> new RuntimeException("Loan not found"));
        loan.setBorrowerName(req.borrowerName);
        loan.setBorrowerContact(req.borrowerContact);
        if (req.principalAmount != null) loan.setPrincipalAmount(req.principalAmount);
        if (req.interestRatePercent != null) loan.setInterestRatePercent(req.interestRatePercent);
        loan.setInterestPeriodNote(req.interestPeriodNote);
        if (req.loanDate != null) loan.setLoanDate(LocalDate.parse(req.loanDate));
        loan.setNotes(req.notes);
        return ResponseEntity.ok(toSummary(loanRepo.save(loan)));
    }

    @PostMapping("/{id}/repayments")
    public ResponseEntity<LoanSummaryDto> addRepayment(@PathVariable Long id, @Valid @RequestBody RepaymentRequest req, Authentication auth) {
        Loan loan = loanRepo.findById(id).orElseThrow(() -> new RuntimeException("Loan not found"));

        LoanRepayment repayment = LoanRepayment.builder()
                .loan(loan)
                .paymentDate(req.getPaymentDate())
                .principalPaid(req.getPrincipalPaid() != null ? req.getPrincipalPaid() : BigDecimal.ZERO)
                .interestPaid(req.getInterestPaid() != null ? req.getInterestPaid() : BigDecimal.ZERO)
                .notes(req.getNotes())
                .createdBy(auth != null ? auth.getName() : "admin")
                .build();
        repaymentRepo.save(repayment);

        // Auto-close the loan once the full principal is recovered
        BigDecimal totalPrincipalPaid = repaymentRepo.sumPrincipalPaidByLoan(id);
        if (totalPrincipalPaid.compareTo(loan.getPrincipalAmount()) >= 0) {
            loan.setStatus(LoanStatus.CLOSED);
            loanRepo.save(loan);
        }

        return ResponseEntity.ok(toSummary(loanRepo.findById(id).orElseThrow()));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<LoanSummaryDto> close(@PathVariable Long id) {
        Loan loan = loanRepo.findById(id).orElseThrow(() -> new RuntimeException("Loan not found"));
        loan.setStatus(LoanStatus.CLOSED);
        return ResponseEntity.ok(toSummary(loanRepo.save(loan)));
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<LoanSummaryDto> reopen(@PathVariable Long id) {
        Loan loan = loanRepo.findById(id).orElseThrow(() -> new RuntimeException("Loan not found"));
        loan.setStatus(LoanStatus.ACTIVE);
        return ResponseEntity.ok(toSummary(loanRepo.save(loan)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        loanRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private LoanSummaryDto toSummary(Loan loan) {
        BigDecimal principalPaid = repaymentRepo.sumPrincipalPaidByLoan(loan.getId());
        BigDecimal interestPaid = repaymentRepo.sumInterestPaidByLoan(loan.getId());
        return LoanSummaryDto.builder()
                .id(loan.getId())
                .borrowerName(loan.getBorrowerName())
                .borrowerContact(loan.getBorrowerContact())
                .principalAmount(loan.getPrincipalAmount())
                .interestRatePercent(loan.getInterestRatePercent())
                .interestPeriodNote(loan.getInterestPeriodNote())
                .loanDate(loan.getLoanDate())
                .status(loan.getStatus().name())
                .notes(loan.getNotes())
                .totalPrincipalPaid(principalPaid)
                .totalInterestPaid(interestPaid)
                .outstandingPrincipal(loan.getPrincipalAmount().subtract(principalPaid))
                .build();
    }
}

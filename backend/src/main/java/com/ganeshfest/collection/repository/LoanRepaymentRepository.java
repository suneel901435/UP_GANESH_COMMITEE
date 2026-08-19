package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long> {

    List<LoanRepayment> findByLoanIdOrderByPaymentDateDesc(Long loanId);

    @Query("SELECT COALESCE(SUM(r.principalPaid), 0) FROM LoanRepayment r WHERE r.loan.id = :loanId")
    BigDecimal sumPrincipalPaidByLoan(@Param("loanId") Long loanId);

    @Query("SELECT COALESCE(SUM(r.interestPaid), 0) FROM LoanRepayment r WHERE r.loan.id = :loanId")
    BigDecimal sumInterestPaidByLoan(@Param("loanId") Long loanId);

    @Query("SELECT COALESCE(SUM(r.principalPaid), 0) FROM LoanRepayment r")
    BigDecimal sumAllPrincipalPaid();

    @Query("SELECT COALESCE(SUM(r.interestPaid), 0) FROM LoanRepayment r")
    BigDecimal sumAllInterestPaid();
}

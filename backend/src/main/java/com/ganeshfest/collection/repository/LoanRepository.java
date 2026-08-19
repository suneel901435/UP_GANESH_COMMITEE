package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.Loan;
import com.ganeshfest.collection.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByOrderByLoanDateDesc();
    List<Loan> findByStatusOrderByLoanDateDesc(LoanStatus status);

    @Query("SELECT COALESCE(SUM(l.principalAmount), 0) FROM Loan l")
    BigDecimal sumAllPrincipalLent();
}

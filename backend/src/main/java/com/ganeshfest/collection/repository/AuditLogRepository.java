package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    @Query("select distinct a.module from AuditLog a order by a.module")
    List<String> findDistinctModules();

    @Query("select distinct a.performedBy from AuditLog a where a.performedBy is not null order by a.performedBy")
    List<String> findDistinctAdmins();
}

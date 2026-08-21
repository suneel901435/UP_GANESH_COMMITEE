package com.ganeshfest.collection.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Tiny helper used inside controller update() methods to record what actually
 * changed, before the new values overwrite the old ones on the entity.
 * Usage:
 *   AuditChangeBuilder diff = new AuditChangeBuilder()
 *       .track("Amount", c.getAmount(), req.amount)
 *       .track("Payment Mode", c.getPaymentMode(), req.paymentMode);
 *   // ...then mutate the entity...
 *   auditLogService.logUpdate(..., diff.build(), auth);
 */
public class AuditChangeBuilder {

    private final List<String> changes = new ArrayList<>();

    public AuditChangeBuilder track(String field, Object oldVal, Object newVal) {
        if (newVal == null) return this; // request didn't touch this field
        String o = oldVal == null ? "—" : oldVal.toString();
        String n = newVal.toString();
        if (!Objects.equals(o, n)) {
            changes.add(field + ": " + o + " → " + n);
        }
        return this;
    }

    /** @return the change summary, or null if nothing actually changed */
    public String build() {
        return changes.isEmpty() ? null : String.join("; ", changes);
    }

    public boolean hasChanges() {
        return !changes.isEmpty();
    }
}

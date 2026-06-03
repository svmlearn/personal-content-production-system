export const SAMPLE_PRD = `【需求】用户可在工作台提交差旅报销单，关联 OA 出差申请，支持附件上传与超标说明。
- 提交后进入审批流，金额 ≤3000 且发票验真通过可自动通过
- 财务可导出月度报销汇总
- 移动端需支持拍照上传发票`;

export const SAMPLE_CODE = `async function submitReimbursement(userId: string, payload: ReimbursePayload) {
  const trip = await oaClient.getTripApplication(payload.tripId);
  if (!trip || trip.status !== 'APPROVED') {
    throw new BizError('TRIP_NOT_APPROVED', '出差单未批准');
  }
  const total = payload.items.reduce((s, i) => s + i.amount, 0);
  if (total > 3000 && !payload.overLimitReason) {
    throw new BizError('OVER_LIMIT', '超标需填写说明');
  }
  const invoiceOk = await invoiceService.verifyBatch(payload.invoices);
  if (total <= 3000 && invoiceOk) {
    return workflow.autoApprove(userId, payload);
  }
  return workflow.startApproval(userId, payload, ['manager', 'finance']);
}`;

export const SAMPLE_LOG = `2025-05-28T14:32:01.442 ERROR [http-nio-8080] c.c.workflow.WorkflowService - Failed to start approval
com.company.BizError: TRIP_NOT_APPROVED: 出差单未批准
  at c.c.reimbursement.ReimbursementService.submit(ReimbursementService.java:47)
  at c.c.api.ReimbursementController.create(ReimbursementController.java:28)
Caused by: java.sql.SQLException: Connection reset
  at com.zaxxer.hikari.pool.ProxyConnection...`;

export const SAMPLE_DIFF = `+  const password = req.body.password;
+  const query = "SELECT * FROM users WHERE name = '" + password + "'";
+  return db.raw(query);`;

export const SAMPLE_API = `POST /api/v1/reimbursements
创建报销单，需 Header: Authorization Bearer token`;

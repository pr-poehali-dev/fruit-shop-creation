export const logAdminAction = async (
  adminId: number,
  actionType: string,
  actionDescription: string,
  targetUserId?: number,
  targetEntityType?: string,
  targetEntityId?: number,
  metadata?: any
) => {
  try {
    await fetch('https://functions.poehali.dev/e5bdda57-9d9d-4506-b4a8-6a4d2bbcd778', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'admin',
        admin_id: adminId,
        action_type: actionType,
        action_description: actionDescription,
        target_user_id: targetUserId,
        target_entity_type: targetEntityType,
        target_entity_id: targetEntityId,
        metadata: metadata || {}
      })
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};
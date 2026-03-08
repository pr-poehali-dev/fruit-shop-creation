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
    await fetch('https://functions.poehali.dev/14c40ab2-8b60-4ccc-b428-bb824cb6871c', {
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
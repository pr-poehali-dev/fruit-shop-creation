export const logUserAction = async (
  userId: number,
  actionType: string,
  actionDescription: string,
  targetEntityType?: string,
  targetEntityId?: number,
  metadata?: any
) => {
  try {
    await fetch('https://functions.poehali.dev/e5bdda57-9d9d-4506-b4a8-6a4d2bbcd778', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'user',
        user_id: userId,
        action_type: actionType,
        action_description: actionDescription,
        target_entity_type: targetEntityType,
        target_entity_id: targetEntityId,
        metadata: metadata || {}
      })
    });
  } catch (error) {
    console.error('Failed to log user action:', error);
  }
};
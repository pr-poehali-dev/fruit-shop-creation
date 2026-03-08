export const logUserAction = async (
  userId: number,
  actionType: string,
  actionDescription: string,
  targetEntityType?: string,
  targetEntityId?: number,
  metadata?: any
) => {
  try {
    await fetch('https://functions.poehali.dev/14c40ab2-8b60-4ccc-b428-bb824cb6871c', {
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
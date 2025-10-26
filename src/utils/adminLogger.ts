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
    const metadataJson = metadata ? JSON.stringify(metadata).replace(/'/g, "''") : '{}';
    const description = actionDescription.replace(/'/g, "''");
    
    const query = `
      INSERT INTO admin_logs 
      (admin_id, action_type, action_description, target_user_id, target_entity_type, target_entity_id, metadata)
      VALUES (
        ${adminId}, 
        '${actionType}', 
        '${description}', 
        ${targetUserId || 'NULL'}, 
        ${targetEntityType ? `'${targetEntityType}'` : 'NULL'}, 
        ${targetEntityId || 'NULL'}, 
        '${metadataJson}'::jsonb
      )
    `;
    
    await fetch('https://poehali.dev/api/internal/sql-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};
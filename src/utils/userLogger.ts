export const logUserAction = async (
  userId: number,
  actionType: string,
  actionDescription: string,
  targetEntityType?: string,
  targetEntityId?: number,
  metadata?: any
) => {
  try {
    const metadataJson = metadata ? JSON.stringify(metadata).replace(/'/g, "''") : '{}';
    const description = actionDescription.replace(/'/g, "''");
    
    const query = `
      INSERT INTO user_logs 
      (user_id, action_type, action_description, target_entity_type, target_entity_id, metadata)
      VALUES (
        ${userId}, 
        '${actionType}', 
        '${description}', 
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
    console.error('Failed to log user action:', error);
  }
};

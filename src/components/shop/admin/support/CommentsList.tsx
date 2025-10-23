import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Comment {
  id: number;
  comment: string;
  is_admin: boolean;
  created_at: string;
  author_name: string;
}

interface CommentsListProps {
  comments: Comment[];
}

const CommentsList = ({ comments }: CommentsListProps) => {
  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Пока нет комментариев
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`flex gap-3 ${comment.is_admin ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  comment.is_admin
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon name={comment.is_admin ? 'Shield' : 'User'} size={16} />
              </div>
              <div className={`flex-1 ${comment.is_admin ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{comment.author_name}</span>
                  {comment.is_admin && (
                    <Badge variant="outline" className="text-xs">
                      Администратор
                    </Badge>
                  )}
                </div>
                <div
                  className={`inline-block rounded-lg px-4 py-2 ${
                    comment.is_admin
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(comment.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default CommentsList;
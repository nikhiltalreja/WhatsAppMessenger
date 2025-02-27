import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageTemplate, Contact } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: MessageTemplate | null;
  contact: Contact | null;
}

export function SendDialog({
  open,
  onOpenChange,
  template,
  contact,
}: SendDialogProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!template || !contact) return;

    setIsSending(true);
    try {
      const res = await apiRequest("POST", "/api/send-message", {
        phoneNumber: contact.phoneNumber,
        message: template.content,
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      toast({
        title: "Message sent successfully",
        description: `Sent to ${contact.name} (${contact.phoneNumber})`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please make sure WhatsApp Web is connected and try again",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send WhatsApp Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!contact && (
            <div className="text-destructive">Please select a contact first</div>
          )}
          {!template && (
            <div className="text-destructive">Please select a template first</div>
          )}

          {contact && template && (
            <>
              <div>
                <div className="font-medium">To:</div>
                <div>
                  {contact.name} ({contact.phoneNumber})
                </div>
              </div>

              <div>
                <div className="font-medium">Template:</div>
                <div>{template.name}</div>
              </div>

              <div>
                <div className="font-medium">Message:</div>
                <div className="whitespace-pre-wrap">{template.content}</div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!contact || !template || isSending}
          >
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send WhatsApp Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
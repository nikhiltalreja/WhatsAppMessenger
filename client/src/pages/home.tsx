import { ContactsList } from "@/components/contacts-list";
import { MessageTemplates } from "@/components/message-templates";
import { SendDialog } from "@/components/send-dialog";
import { useState } from "react";
import { MessageTemplate, Contact } from "@shared/schema";

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSendOpen, setIsSendOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold text-primary">WhatsApp Automation</h1>
      </header>
      
      <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ContactsList
            onSelect={setSelectedContact}
            selectedContact={selectedContact}
          />
        </div>
        <div>
          <MessageTemplates
            onSelect={setSelectedTemplate}
            selectedTemplate={selectedTemplate}
            onSend={() => {
              if (selectedTemplate) {
                setIsSendOpen(true);
              }
            }}
          />
        </div>
      </div>

      <SendDialog
        open={isSendOpen}
        onOpenChange={setIsSendOpen}
        template={selectedTemplate}
        contact={selectedContact}
      />
    </div>
  );
}

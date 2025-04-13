import { useEffect, useState } from "react";
import { getSocket } from "~/utils/socket.client";
import { Editor } from "@monaco-editor/react";

type CollaborationEditorProps = {
    documentId: string;
    initialContent: string;
};

export function CollaborationEditor({
    documentId,
    initialContent,
}: CollaborationEditorProps) {
    const [content, setContent] = useState(initialContent);

    useEffect(() => {
        const socket = getSocket();

        socket.emit("join_document", { documentId });

        socket.on("content_change", ({ content: newContent }) => {
            setContent(newContent);
        });

        return () => {
            socket.emit("leave_document", { documentId });
            socket.off("content_change");
        };
    }, [documentId]);

    const handleChange = (value: string | undefined) => {
        if (!value) return;

        setContent(value);
        const socket = getSocket();
        socket.emit("update_content", {
            documentId,
            content: value,
        });
    };

    return (
        <div className="h-[600px] border rounded-lg">
            <Editor
                height="100%"
                language="markdown"
                theme="vs-dark"
                value={content}
                onChange={handleChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    automaticLayout: true,
                }}
            />
        </div>
    );
}
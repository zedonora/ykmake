import { type ActionFunctionArgs, type MetaFunction, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { db } from "~/lib/drizzle.server";
import { communityPosts } from "~/db/schema";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Discussion | YkMake 커뮤니티" },
    { name: "description", content: "Ask questions, share ideas, and connect with other developers." },
  ];
};

const categories = ["Development", "Design", "Marketing", "Startups", "AI", "Productivity"];

const PostSchema = z.object({
  title: z.string().min(3, "제목은 3글자 이상이어야 합니다.").max(40, "제목은 40자를 넘을 수 없습니다."),
  category: z.string().min(1, "카테고리를 선택해주세요."),
  content: z.string().min(10, "내용은 10글자 이상이어야 합니다.").max(1000, "내용은 1000자를 넘을 수 없습니다."),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, headers } = await createSupabaseServerClient(request);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return redirect("/login?redirectTo=/community/new");
  }

  const formData = await request.formData();
  const submission = PostSchema.safeParse(Object.fromEntries(formData));

  if (!submission.success) {
    return Response.json({ errors: submission.error.flatten().fieldErrors }, { status: 400, headers });
  }

  try {
    const newPost = await db.insert(communityPosts).values({
      title: submission.data.title,
      content: submission.data.content,
      category: submission.data.category,
      userId: user.id,
    }).returning({ insertedId: communityPosts.id });

    const insertedId = newPost[0]?.insertedId;

    if (insertedId) {
      return redirect(`/community/${insertedId}`, { headers });
    } else {
      throw new Error("Failed to get inserted post ID");
    }

  } catch (error) {
    console.error("Error creating post:", error);
    return Response.json({ error: "게시글 생성 중 오류가 발생했습니다.", errors: null }, { status: 500, headers });
  }
};

export default function NewCommunityPostPage() {
  const actionData = useActionData<typeof action>();
  const titleErrors = actionData?.errors?.title;
  const categoryErrors = actionData?.errors?.category;
  const contentErrors = actionData?.errors?.content;
  const generalError = actionData?.error;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Create Discussion</h1>
        <p className="text-lg text-muted-foreground">
          Ask questions, share ideas, and connect with other developers
        </p>
      </div>
      <Form method="post" className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <span className="text-xs text-muted-foreground ml-2">(40 characters or less)</span>
          <Input
            id="title"
            name="title"
            type="text"
            required
            maxLength={40}
            className={cn(titleErrors ? "border-destructive" : "")}
            aria-invalid={titleErrors ? true : undefined}
            aria-describedby={titleErrors ? "title-error" : undefined}
          />
          {titleErrors && (
            <p id="title-error" className="text-sm text-destructive">{titleErrors[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <span className="text-xs text-muted-foreground ml-2">Select the category that best fits your discussion</span>
          <Select name="category" required>
            <SelectTrigger
              id="category"
              className={cn(categoryErrors ? "border-destructive" : "")}
              aria-invalid={categoryErrors ? true : undefined}
              aria-describedby={categoryErrors ? "category-error" : undefined}
            >
              <SelectValue placeholder="i.e Productivity" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryErrors && (
            <p id="category-error" className="text-sm text-destructive">{categoryErrors[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <span className="text-xs text-muted-foreground ml-2">(1000 characters or less)</span>
          <Textarea
            id="content"
            name="content"
            rows={10}
            required
            maxLength={1000}
            className={cn(contentErrors ? "border-destructive" : "")}
            aria-invalid={contentErrors ? true : undefined}
            aria-describedby={contentErrors ? "content-error" : undefined}
          />
          {contentErrors && (
            <p id="content-error" className="text-sm text-destructive">{contentErrors[0]}</p>
          )}
        </div>

        {generalError && (
          <p className="text-sm text-destructive">{generalError}</p>
        )}

        <div className="text-center pt-4">
          <Button type="submit" size="lg">
            Create Discussion
          </Button>
        </div>
      </Form>
    </div>
  );
}
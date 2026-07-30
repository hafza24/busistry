import { supabase } from "@/integrations/supabase/client";
import { callApi, ServiceError, unwrap, validate } from "./core/api";
import {
  CreateContactMessageSchema,
  CreateReviewSchema,
  CreateSupportTicketSchema,
  NewsletterSubscribeSchema,
  type CreateContactMessageInput,
  type CreateReviewInput,
  type CreateSupportTicketInput,
  type NewsletterSubscribeInput,
} from "./schemas";

export async function createSupportTicket(input: CreateSupportTicketInput) {
  const data = validate(CreateSupportTicketSchema, input);

  return callApi("support_tickets.create", data, {
    fallback: async () => {
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;
      if (!userId) throw new ServiceError("Authentication required", 401);
      return unwrap(
        await supabase
          .from("support_tickets")
          .insert({ ...data, user_id: userId, status: "open" })
          .select("id, status")
          .single()
      );
    },
  });
}

export async function sendContactMessage(input: CreateContactMessageInput) {
  const data = validate(CreateContactMessageSchema, input);

  return callApi("contact_messages.create", data, {
    fallback: async () =>
      unwrap(
        await supabase
          .from("contact_messages")
          .insert({ ...data, status: "new" })
          .select("id")
          .single()
      ),
  });
}

/** Reviews require a matching fulfilled purchase — enforced server-side. */
export async function createReview(input: CreateReviewInput) {
  const data = validate(CreateReviewSchema, input);

  return callApi("reviews.create", data, {
    fallback: async () => {
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;
      if (!userId) throw new ServiceError("Authentication required", 401);
      return unwrap(
        await supabase
          .from("reviews")
          .insert({
            user_id: userId,
            target_type: data.target_type,
            target_id: data.target_id,
            rating: data.rating,
            title: data.title || null,
            comment: data.comment || null,
            is_approved: false,
          })
          .select("id, is_approved")
          .single()
      );
    },
  });
}

export async function subscribeToNewsletter(input: NewsletterSubscribeInput) {
  const data = validate(NewsletterSubscribeSchema, input);

  return callApi("newsletter.subscribe", data, {
    fallback: async () =>
      unwrap(
        await supabase
          .from("newsletter_subscribers")
          .insert({ email: data.email.toLowerCase(), source: data.source, status: "subscribed" })
          .select("id")
          .single()
      ),
  });
}

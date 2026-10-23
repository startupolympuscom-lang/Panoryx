import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CreateMessageChannelForm } from "@/components/app/panostation/create-message-channel-form";
import { SendChannelMessageForm } from "@/components/app/panostation/send-channel-message-form";
import { formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Messagerie interne" };

export default async function MessageriePage() {
  const user = await getCurrentUser();
  const org = await getCurrentOrg();
  if (!user || !org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: channels } = await supabase
    .from("message_channels")
    .select("id, name, created_at")
    .eq("organization_id", org.organizationId)
    .order("name");

  const channelIds = (channels ?? []).map((c) => c.id);

  const { data: messages } = channelIds.length
    ? await supabase
        .from("channel_messages")
        .select("id, channel_id, body, created_at, profiles(full_name)")
        .in("channel_id", channelIds)
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] };

  type MessageRow = NonNullable<typeof messages>[number];
  const messagesByChannel = new Map<string, MessageRow[]>();
  for (const m of messages ?? []) {
    const list = messagesByChannel.get(m.channel_id) ?? [];
    list.push(m);
    messagesByChannel.set(m.channel_id, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Messagerie interne</h1>
        <p className="mt-1 text-sm text-navy-500">
          Canaux d&apos;équipe pour communiquer sans passer par WhatsApp (ex. Fournisseurs, Équipe
          station, Urgences).
        </p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Canaux</h2>
        <div className="mt-4">
          <CreateMessageChannelForm organizationId={org.organizationId} userId={user.id} />
        </div>
      </div>

      {!channels || channels.length === 0 ? (
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <p className="text-sm text-navy-500">Aucun canal créé pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {channels.map((c) => {
            const channelMessages = (messagesByChannel.get(c.id) ?? []).slice().reverse();
            return (
              <div key={c.id} className="flex flex-col rounded-lg border border-navy-100 bg-white p-5">
                <h3 className="text-sm font-semibold text-navy"># {c.name}</h3>
                <div className="mt-3 max-h-72 flex-1 space-y-3 overflow-y-auto">
                  {channelMessages.length === 0 ? (
                    <p className="text-sm text-navy-500">Aucun message pour l&apos;instant.</p>
                  ) : (
                    channelMessages.map((m) => {
                      const authorName = Array.isArray(m.profiles)
                        ? m.profiles[0]?.full_name
                        : (m.profiles as { full_name: string } | null)?.full_name;
                      return (
                        <div key={m.id} className="rounded-md bg-navy-50 px-3 py-2 text-sm">
                          <p className="text-navy">{m.body}</p>
                          <p className="mt-1 text-xs text-navy-400">
                            {authorName ?? "—"} · {formatDateTimeFr(m.created_at)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="mt-4">
                  <SendChannelMessageForm userId={user.id} channelId={c.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

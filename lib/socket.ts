"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1")
  .replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
let sharedSocket: Socket | null = null;
let socketToken: string | null = null;
function getSocket(token: string) {
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"], reconnection: true });
    socketToken = token;
  } else if (socketToken !== token) {
    socketToken = token;
    sharedSocket.auth = { token };
    sharedSocket.disconnect().connect();
  }
  return sharedSocket;
}
function useSocketIdentity() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;
  useEffect(() => {
    if (status === "unauthenticated") {
      sharedSocket?.disconnect(); sharedSocket = null; socketToken = null;
    }
  }, [status]);
  return { userId: session?.user?._id, accessToken };
}
type InboxHandlers = { onNewMessage?: (payload: unknown) => void; onMessageRead?: (payload: unknown) => void; onNewConversation?: (payload: unknown) => void };
export function useInboxSocket(activeChatId: string | null, handlers: InboxHandlers) {
  const { userId, accessToken } = useSocketIdentity();
  const handlersRef = useRef(handlers);
  useEffect(() => { handlersRef.current = handlers; }, [handlers]);
  useEffect(() => {
    if (!userId || !accessToken) return;
    const socket = getSocket(accessToken);
    const join = () => { socket.emit("join-user-room", { _id: userId }); };
    if (socket.connected) join(); socket.on("connect", join);
    const onNewMessage = (payload: unknown) => handlersRef.current.onNewMessage?.(payload);
    const onMessageRead = (payload: unknown) => handlersRef.current.onMessageRead?.(payload);
    const onNewConversation = (payload: unknown) => handlersRef.current.onNewConversation?.(payload);
    socket.on("inbox:new-message", onNewMessage); socket.on("inbox:read", onMessageRead); socket.on("inbox:new-conversation", onNewConversation);
    return () => { socket.off("connect", join); socket.off("inbox:new-message", onNewMessage); socket.off("inbox:read", onMessageRead); socket.off("inbox:new-conversation", onNewConversation); };
  }, [userId, accessToken]);
  useEffect(() => {
    if (!activeChatId || !accessToken || !userId) return;
    const socket = getSocket(accessToken);
    const join = () => { socket.emit("join-chat", { _id: activeChatId }); };
    if (socket.connected) join(); socket.on("connect", join);
    return () => { socket.emit("leave-chat", activeChatId); socket.off("connect", join); };
  }, [activeChatId, accessToken, userId]);
}
export function useSocketEvent<T = unknown>(event: string, handler: (payload: T) => void) {
  const { userId, accessToken } = useSocketIdentity();
  const handlerRef = useRef(handler);
  useEffect(() => { handlerRef.current = handler; }, [handler]);
  useEffect(() => {
    if (!userId || !accessToken) return;
    const socket = getSocket(accessToken);
    const join = () => { socket.emit("join-user-room", { _id: userId }); };
    if (socket.connected) join(); socket.on("connect", join);
    const wrapped = (payload: T) => handlerRef.current(payload); socket.on(event, wrapped);
    return () => { socket.off("connect", join); socket.off(event, wrapped); };
  }, [userId, accessToken, event]);
}

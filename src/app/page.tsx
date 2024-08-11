import ChatContainer from "@/components/chat-container";
import UserLoginDialog from "@/components/user-login-dialog";

export default function Home() {
  return (
    <main className="flex h-svh w-full items-center justify-center border-2 border-red-700">
      <ChatContainer />
      <UserLoginDialog />
    </main>
  );
}

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ChatWidget from "@/components/ChatWidget";

export default function AppLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <ChatWidget />
    </>
  );
}

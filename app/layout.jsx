export const metadata = {
  title: "Business AI Chatbot",
  description: "Custom AI chatbot for businesses"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

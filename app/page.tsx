import dynamic from "next/dynamic";

const Cam = dynamic(() => import("./client/Cam"), { ssr: false });

export default function Home() {
  return (
    <Cam />
  );
}

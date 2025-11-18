import { Topbar } from "../component/Topbar/topbar";

export default function Home() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <header className="w-full flex justify-center items-center">
        <Topbar />
      </header>
    </div>
  );
}

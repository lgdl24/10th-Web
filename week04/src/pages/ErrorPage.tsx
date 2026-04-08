import onerImg from "../assets/oner.jpg";

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center h-dvh">
      <img src={onerImg} alt="error" className="w-full h-auto" />
    </div>
  );
}

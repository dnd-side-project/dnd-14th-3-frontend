import { useParams } from "react-router-dom";

export default function CompanionDetailPage() {
  const { reservationId } = useParams();
  return <div>{`동행예약상사페이지 ${reservationId ?? "-"}`}</div>;
}

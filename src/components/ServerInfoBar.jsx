import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function ServerInfoBar() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const fallback = {
      hostName: window.location.hostname || "local-file",
      serverIp: "확인 중",
      lbHeader: "N/A",
      azureZone: "N/A (Local/Non-Azure)",
      dbHost: "확인 중",
    };

    apiFetch("/api/server-info")
      .then((nextInfo) => setInfo({ ...fallback, ...nextInfo }))
      .catch((error) => {
        console.warn("서버 배포 정보 API 연결 실패, 기본 정보를 표시합니다.", error);
        setInfo(fallback);
      });
  }, []);

  if (!info) return null;

  return (
    <div className="server-info">
      <div className="server-info-inner">
        <InfoItem label="Host Name" value={info.hostName} />
        <InfoItem label="Server IP" value={info.serverIp} />
        <InfoItem label="LB Header" value={info.lbHeader} />
        <InfoItem label="Azure Zone" value={info.azureZone} />
        <InfoItem label="DB Host" value={info.dbHost} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="server-info-item">
      <strong>{label}</strong>
      <span title={value}>{value}</span>
    </div>
  );
}

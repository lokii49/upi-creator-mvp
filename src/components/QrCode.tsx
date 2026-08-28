// Center-logo QR frame — the same pattern every UPI app's own QR uses
// (GPay/PhonePe/Paytm all put a small logo dead center). Safe because
// usePaySession generates the code at errorCorrectionLevel "H" (~30%
// obstruction budget) and the logo here covers a fraction of that. The
// frame/padding is purely decorative and never touches the QR pixels.
export function QrCode({ dataUrl, size = 190 }: { dataUrl: string | null; size?: number }) {
  const logoSize = Math.round(size * 0.22);
  const logoBacking = logoSize + 10;

  return (
    <div
      className="relative flex items-center justify-center rounded-2xl border-2 border-accent-soft bg-white p-2"
      style={{ minHeight: size, minWidth: size }}
    >
      {dataUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="UPI QR code" width={size} height={size} className="rounded-lg" />
          <div
            aria-hidden
            className="absolute flex items-center justify-center rounded-xl bg-white shadow-[0_2px_8px_rgba(15,23,42,0.18)]"
            style={{ height: logoBacking, width: logoBacking }}
          >
            <div
              className="flex items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent2 font-extrabold text-white"
              style={{ height: logoSize, width: logoSize, fontSize: logoSize * 0.55 }}
            >
              ₹
            </div>
          </div>
        </>
      ) : (
        <span className="text-xs text-muted">Generating QR…</span>
      )}
    </div>
  );
}

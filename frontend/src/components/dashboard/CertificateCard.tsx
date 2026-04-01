interface CertificateCardProps {
  certificateCode: string
  courseName: string
  issuedAt: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function CertificateCard({
  certificateCode,
  courseName,
  issuedAt,
}: CertificateCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm" data-testid={`certificate-card-${certificateCode}`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">{courseName}</h4>
          <p className="mt-1 text-sm text-gray-500">
            Emitido em {formatDate(issuedAt)}
          </p>
        </div>
        <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          Certificado
        </span>
      </div>
      <div className="mt-3 rounded bg-gray-50 p-2">
        <p className="text-xs text-gray-500">Código</p>
        <p className="font-mono text-sm text-gray-700" data-testid="certificate-card-code">{certificateCode}</p>
      </div>
    </div>
  )
}

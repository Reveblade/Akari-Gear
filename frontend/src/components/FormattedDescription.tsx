interface FormattedDescriptionProps {
  text: string
  className?: string
  /** Satır sayısıyla sınırlamak için (örn: line-clamp-2) */
  lineClamp?: string
}

/**
 * Ürün açıklamalarında Enter ile girilen alt satır geçişlerini korur.
 * \n, \r\n, \r karakterlerini gerçek satır sonlarına dönüştürür.
 */
export function FormattedDescription({ text, className = '', lineClamp }: FormattedDescriptionProps) {
  const classes = ['leading-relaxed', lineClamp, className].filter(Boolean).join(' ')
  const lines = text.split(/\r\n|\r|\n/)
  return (
    <p className={classes}>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  )
}

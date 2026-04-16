import { useState } from 'react'
import type { CadastroItem } from '../../types/cadastro-item'

type CrudSectionProps = {
  title: string
  icon: string
  items: CadastroItem[]
  onAdd: (value: string) => void | Promise<void>
  onDelete: (id: number) => void | Promise<void>
  placeholder: string
  colors: {
    primary: string
    accent: string
    red: string
    text: string
    muted: string
  }
}

export default function CrudSection({
  title,
  icon,
  items,
  onAdd,
  onDelete,
  placeholder,
  colors,
}: CrudSectionProps) {
  const [val, setVal] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    const texto = val.trim()
    if (!texto || saving) return

    const jaExiste = items.some(
      (item) => item.nome.trim().toLowerCase() === texto.toLowerCase(),
    )

    if (jaExiste) {
      setVal('')
      return
    }

    try {
      setSaving(true)
      await onAdd(texto)
      setVal('')
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await onDelete(id)
    } catch (error) {
      console.error('Erro ao excluir item:', error)
    }
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: colors.primary,
          marginBottom: 12,
        }}
      >
        {icon} {title}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            border: '1.5px solid #dde3ed',
            fontSize: 14,
            outline: 'none',
            color: colors.text,
            background: '#f9fbff',
            boxSizing: 'border-box',
          }}
          placeholder={placeholder}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />

        <button
          onClick={handleAdd}
          disabled={saving}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            background: `linear-gradient(135deg,${colors.accent},${colors.primary})`,
            color: '#fff',
            fontWeight: 700,
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: 14,
            whiteSpace: 'nowrap',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Salvando...' : '+ Adicionar'}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.length === 0 ? (
          <span
            style={{
              fontSize: 13,
              color: colors.muted,
              fontStyle: 'italic',
            }}
          >
            Nenhum item cadastrado.
          </span>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: `${colors.primary}10`,
                border: `1.5px solid ${colors.primary}30`,
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 13,
                color: colors.primary,
                fontWeight: 600,
              }}
            >
              {item.nome}
              <button
                onClick={() => handleDelete(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.red,
                  fontSize: 15,
                  lineHeight: 1,
                  padding: 0,
                }}
                title="Excluir"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
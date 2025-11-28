import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './App.css'

interface Produto {
  id: number
  nome: string
  preco: number
  estoque: number
  created_at: string
  updated_at: string
}

// shape returned by API (preco may be string because DRF DecimalField is serialized as string)
interface ApiProduto {
  id: number
  nome: string
  preco: string | number
  estoque: number
  created_at: string
  updated_at: string
}

function App() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    estoque: ''
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Prefer explicit VITE_API_URL only when it's a browser-reachable host (localhost).
  // Otherwise prefer the relative '/api' path so the dev server proxy forwards calls
  // to the internal backend host (useful when running the whole stack with docker-compose).
  // typed access to import.meta.env to avoid `any`
  const meta = import.meta as unknown as { env?: { VITE_API_URL?: string } }
  const _envApi = (meta.env?.VITE_API_URL ?? '').trim()

  // Normalize helper: remove trailing slashes and ensure we don't duplicate '/api'
  const normalizeBase = (raw: string) => {
    if (!raw) return ''
    // strip trailing slashes — prefer const instead of let
    const out = raw.replace(/\/+$/, '')
    // if the host contains '/api' at the end keep it (we'll join correctly later), just avoid double slashes
    return out
  }

  const envApi = normalizeBase(_envApi)

  // safe URL builder used by multiple functions (stable reference via useCallback)
  const buildUrl = useCallback((base: string, p: string) => base.endsWith('/') ? `${base}${p.replace(/^\//, '')}` : `${base}/${p.replace(/^\//, '')}`, [])

  // If VITE_API_URL is explicitly a browser-reachable host (localhost or 127.*), use it, else proxy via '/api'
  const API_BASE_URL = envApi && /^https?:\/\/(localhost|127\.0\.0\.1)/.test(envApi) ? envApi : '/api'

  // ensure fetchProdutos is stable and add to deps to satisfy the hooks linter
  const fetchProdutos = useCallback(async () => {
    try {
      const response = await axios.get<ApiProduto[]>(buildUrl(API_BASE_URL, 'produtos/'))
      // backend returns Decimal as string — normalize preco to Number so UI can use toFixed safely
      const normalized: Produto[] = response.data.map((p) => ({ ...p, preco: Number(p.preco) }))
      setProdutos(normalized)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    }
  }, [API_BASE_URL, buildUrl])

  useEffect(() => {
    fetchProdutos()
  }, [fetchProdutos])

  // fetchProdutos moved above and memoized via useCallback

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate & parse inputs
      const nome = formData.nome.trim()
      const preco = parseFloat(formData.preco)
      const estoque = parseInt(formData.estoque)

      if (!nome) {
        alert('Nome é obrigatório')
        setLoading(false)
        return
      }
      if (!Number.isFinite(preco)) {
        alert('Preço inválido')
        setLoading(false)
        return
      }
      if (!Number.isFinite(estoque)) {
        alert('Estoque inválido')
        setLoading(false)
        return
      }

      const data = { nome, preco, estoque }

      if (editingId) {
        await axios.put(buildUrl(API_BASE_URL, `produtos/${editingId}/`), data)
        setEditingId(null)
      } else {
        await axios.post(buildUrl(API_BASE_URL, 'produtos/'), data)
      }

      setFormData({ nome: '', preco: '', estoque: '' })
      fetchProdutos()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (produto: Produto) => {
    setFormData({
      nome: produto.nome,
      preco: produto.preco.toString(),
      estoque: produto.estoque.toString()
    })
    setEditingId(produto.id)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await axios.delete(buildUrl(API_BASE_URL, `produtos/${id}/`))
        fetchProdutos()
      } catch (error) {
        console.error('Erro ao excluir produto:', error)
      }
    }
  }

  const handleCancel = () => {
    setFormData({ nome: '', preco: '', estoque: '' })
    setEditingId(null)
  }

  return (
    <div className="app">
      <h1>Gerenciador de Mercado</h1>

      <div className="container">
        <div className="form-section">
          <h2>{editingId ? 'Editar Produto' : 'Cadastrar Produto'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="preco">Preço (R$):</label>
              <input
                type="number"
                id="preco"
                step="0.01"
                value={formData.preco}
                onChange={(e) => setFormData({...formData, preco: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="estoque">Estoque:</label>
              <input
                type="number"
                id="estoque"
                value={formData.estoque}
                onChange={(e) => setFormData({...formData, estoque: e.target.value})}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Cadastrar')}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="list-section">
          <h2>Produtos Cadastrados</h2>
          {produtos.length === 0 ? (
            <p>Nenhum produto cadastrado ainda.</p>
          ) : (
            <div className="produtos-grid">
              {produtos.map((produto) => (
                <div key={produto.id} className="produto-card">
                  <h3>{produto.nome}</h3>
                  <p>
                    <strong>Preço:</strong>{' '}
                    R$ {typeof produto.preco === 'number' && !isNaN(produto.preco) ? produto.preco.toFixed(2) : String(produto.preco)}
                  </p>
                  <p><strong>Estoque:</strong> {produto.estoque} unidades</p>
                  <div className="card-buttons">
                    <button onClick={() => handleEdit(produto)} className="edit-btn">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(produto.id)} className="delete-btn">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

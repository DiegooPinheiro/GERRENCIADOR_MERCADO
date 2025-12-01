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

// formato retornado pela API (preco pode ser string porque DRF DecimalField é serializado como string)
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

  // Prefere VITE_API_URL explícito apenas quando é um host acessível pelo navegador (localhost).
  // Caso contrário, prefere o caminho relativo '/api' para que o proxy do servidor de desenvolvimento encaminhe as chamadas
  // para o host interno do backend (útil ao executar toda a pilha com docker-compose).
  // acesso tipado a import.meta.env para evitar `any`
  const meta = import.meta as unknown as { env?: { VITE_API_URL?: string } }
  const _envApi = (meta.env?.VITE_API_URL ?? '').trim()

  // Auxiliar de normalização: remove barras finais e garante que não dupliquemos '/api'
  const normalizeBase = (raw: string) => {
    if (!raw) return ''
    // remove barras finais — prefere const em vez de let
    const out = raw.replace(/\/+$/, '')
    // se o host contém '/api' no final, mantenha (juntaremos corretamente depois), apenas evite barras duplas
    return out
  }

  const envApi = normalizeBase(_envApi)

  // construtor de URL seguro usado por múltiplas funções (referência estável via useCallback)
  const buildUrl = useCallback((base: string, p: string) => base.endsWith('/') ? `${base}${p.replace(/^\//, '')}` : `${base}/${p.replace(/^\//, '')}`, [])

  // Se VITE_API_URL é explicitamente um host acessível pelo navegador (localhost ou 127.*), use-o, senão proxy via '/api'
  const API_BASE_URL = envApi && /^https?:\/\/(localhost|127\.0\.0\.1)/.test(envApi) ? envApi : '/api'

  // garante que fetchProdutos seja estável e adicione às deps para satisfazer o linter de hooks
  const fetchProdutos = useCallback(async () => {
    try {
      const response = await axios.get<ApiProduto[]>(buildUrl(API_BASE_URL, 'produtos/'))
      // backend retorna Decimal como string — normalize preco para Number para que a UI possa usar toFixed com segurança
      const normalized: Produto[] = response.data.map((p) => ({ ...p, preco: Number(p.preco) }))
      setProdutos(normalized)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    }
  }, [API_BASE_URL, buildUrl])

  useEffect(() => {
    fetchProdutos()
  }, [fetchProdutos])

  // fetchProdutos movido acima e memoizado via useCallback

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar e analisar entradas
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

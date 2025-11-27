import { useState, useEffect } from 'react'
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

function App() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    estoque: ''
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

  useEffect(() => {
    fetchProdutos()
  }, [])

  const fetchProdutos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/produtos/`)
      setProdutos(response.data)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        nome: formData.nome,
        preco: parseFloat(formData.preco),
        estoque: parseInt(formData.estoque)
      }

      if (editingId) {
        await axios.put(`${API_BASE_URL}/produtos/${editingId}/`, data)
        setEditingId(null)
      } else {
        await axios.post(`${API_BASE_URL}/produtos/`, data)
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
        await axios.delete(`${API_BASE_URL}/produtos/${id}/`)
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
                  <p><strong>Preço:</strong> R$ {produto.preco.toFixed(2)}</p>
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

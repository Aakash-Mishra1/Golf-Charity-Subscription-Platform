import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { FiSearch, FiArrowLeft } from 'react-icons/fi'

export default function CharitiesPage() {
  const { user } = useAuth()
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selecting, setSelecting] = useState(null)

  useEffect(() => {
    api.get('/api/charities').then(r => setCharities(r.data.charities || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  )

  const featured = filtered.filter(c => c.is_featured)
  const regular = filtered.filter(c => !c.is_featured)

  const handleSelect = async (charityId) => {
    if (!user) { toast.error('Please log in to select a charity'); return }
    setSelecting(charityId)
    try {
      await api.put('/api/users/charity', { charity_id: charityId })
      toast.success('Charity updated!')
    } catch {
      toast.error('Failed to update charity')
    } finally {
      setSelecting(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080C0A' }}>
      <Navbar />
      <div style={{ padding: '100px 0 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

          {user && (
            <Link to="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'rgba(240,253,244,0.5)', fontSize: 14, textDecoration: 'none',
              marginBottom: 24, transition: 'color 0.2s',
            }}>
              <FiArrowLeft size={14} /> Dashboard
            </Link>
          )}

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <span style={{ background: 'rgba(74,222,128,0.15)', color: '#4ADE80', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em' }}>💚 Give Back</span>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#F0FDF4' }}>Our Charity Partners</h1>
            <p style={{ fontSize: 17, color: 'rgba(240,253,244,0.55)', maxWidth: 520, lineHeight: 1.7 }}>Every subscription you take out helps fund one of these incredible causes. You choose who benefits.</p>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto 48px' }}>
            <FiSearch size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,253,244,0.3)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search charities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 44, width: '100%', background: '#0E1410', border: '1px solid rgba(255,255,255,0.07)', color: '#F0FDF4', fontFamily: 'DM Sans, sans-serif', fontSize: 15, padding: '13px 16px 13px 44px', borderRadius: 14, outline: 'none' }}
            />
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginTop: 32 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ height: 200, borderRadius: 16, background: '#111814' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(240,253,244,0.3)' }}>No charities found</div>
          ) : (
            <>
              {featured.length > 0 && (
                <div style={{ marginTop: 40 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4ADE80', marginBottom: 16 }}>⭐ Featured Charity</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    {featured.map(c => <CharityCard key={c.id} charity={c} user={user} selecting={selecting} onSelect={handleSelect} featured />)}
                  </div>
                </div>
              )}
              {regular.length > 0 && (
                <div style={{ marginTop: 40 }}>
                  {featured.length > 0 && (
                    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(240,253,244,0.3)', marginBottom: 16 }}>All Charities</p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    {regular.map(c => <CharityCard key={c.id} charity={c} user={user} selecting={selecting} onSelect={handleSelect} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CharityCard({ charity, user, selecting, onSelect, featured }) {
  const [hovered, setHovered] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: featured ? 'linear-gradient(135deg, rgba(74,222,128,0.08), #111814)' : '#111814',
        border: `1px solid ${hovered ? '#4ADE80' : featured ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 40px rgba(74,222,128,0.12)' : 'none',
        gridColumn: featured ? '1 / -1' : 'auto',
      }}
    >
      {featured && (
        <div style={{ margin: '20px 24px 0', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,0.15)', color: '#4ADE80', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999, width: 'fit-content' }}>
          ⭐ Featured
        </div>
      )}
      <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,253,244,0.3)' }}>{charity.category}</span>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#F0FDF4', margin: 0 }}>{charity.name}</h3>
        <p style={{ fontSize: 14, color: 'rgba(240,253,244,0.55)', lineHeight: 1.7, flex: 1, margin: 0 }}>{charity.description}</p>
      </div>
      {user && (
        <button
          onClick={() => onSelect(charity.id)}
          disabled={selecting === charity.id}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            margin: '0 24px 24px',
            padding: '12px 20px',
            background: btnHovered ? '#4ADE80' : 'transparent',
            border: `1px solid ${btnHovered ? '#4ADE80' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 10,
            color: btnHovered ? '#080C0A' : '#F0FDF4',
            fontSize: 14,
            fontWeight: 600,
            cursor: selecting === charity.id ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: selecting === charity.id ? 0.5 : 1,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {selecting === charity.id ? 'Updating...' : 'Support This Charity'}
        </button>
      )}
    </div>
  )
}

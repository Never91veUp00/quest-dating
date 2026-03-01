import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import { requireAdmin } from '@src/middleware/auth.js'

const SECRET = process.env.JWT_SECRET

// Хелперы для создания req/res/next моков
const mockReq = (headers = {}) => ({ headers })
const mockRes = () => {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json   = vi.fn().mockReturnValue(res)
  return res
}
const mockNext = () => vi.fn()

describe('requireAdmin middleware', () => {
  describe('отсутствие токена', () => {
    it('возвращает 401 если заголовок Authorization отсутствует', () => {
      const req  = mockReq({})
      const res  = mockRes()
      const next = mockNext()

      requireAdmin(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('возвращает 401 если заголовок не начинается с Bearer', () => {
      const req  = mockReq({ authorization: 'Basic abc123' })
      const res  = mockRes()
      const next = mockNext()

      requireAdmin(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('невалидный токен', () => {
    it('возвращает 401 для подписанного другим секретом токена', () => {
      const token = jwt.sign({ username: 'admin', role: 'admin' }, 'wrong-secret')
      const req   = mockReq({ authorization: `Bearer ${token}` })
      const res   = mockRes()
      const next  = mockNext()

      requireAdmin(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Невалидный токен' })
      )
    })

    it('возвращает 401 с сообщением об истечении для просроченного токена', () => {
      const token = jwt.sign(
        { username: 'admin', role: 'admin' },
        SECRET,
        { expiresIn: -1 } // уже истёк
      )
      const req  = mockReq({ authorization: `Bearer ${token}` })
      const res  = mockRes()
      const next = mockNext()

      requireAdmin(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Токен истёк' })
      )
    })

    it('возвращает 403 если role !== admin', () => {
      const token = jwt.sign({ username: 'user', role: 'user' }, SECRET)
      const req   = mockReq({ authorization: `Bearer ${token}` })
      const res   = mockRes()
      const next  = mockNext()

      requireAdmin(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Недостаточно прав' })
      )
    })
  })

  describe('валидный токен', () => {
    it('вызывает next() и добавляет req.admin для корректного токена', () => {
      const payload = { username: 'admin', role: 'admin' }
      const token   = jwt.sign(payload, SECRET)
      const req     = mockReq({ authorization: `Bearer ${token}` })
      const res     = mockRes()
      const next    = mockNext()

      requireAdmin(req, res, next)

      expect(next).toHaveBeenCalledOnce()
      expect(req.admin).toMatchObject({ username: 'admin', role: 'admin' })
      expect(res.status).not.toHaveBeenCalled()
    })
  })
})

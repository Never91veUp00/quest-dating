import express from 'express'
import datesRoutes from './dates.js'
import templatesRoutes from './templates.js'
import ordersRoutes from './orders.js'

const router = express.Router()

router.use('/dates', datesRoutes)
router.use('/templates', templatesRoutes)
router.use('/orders', ordersRoutes)

export default router
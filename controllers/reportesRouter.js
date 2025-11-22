import { Router } from 'express'
import Product from '../models/product.js'
import createCsvWriter from 'csv-writer'

const reportesRouter = Router()

reportesRouter.get('/', async (req, res) => {
  try {
    const productos = await Product.find({}).populate('user', {
      name: 1,
    })
    //Creo un array de objetos con las claves bien formateadas
    const rows = productos.map((p) => ({
      ID: p._id.toString(),
      Nombre: p.name,
      Precio: p.price,
      Stock: p.stock,
      Serial: p.serial_number,
      DescripcionIA: p.description_ia,
      CategoriaIA: p.category_ia,
      Imagen: p.image_url,
      Usuario: p.user?.name || 'N/A',
      Fecha: p.createdAt?.toISOString() || '',
    }))

    // Configuramos destino temporal
    const filePath = '/tmp/inventario.csv'
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filePath,

      //Configuracion de las cabeceras id/nombre/precio... con el metodo Objet de los arrays sin formatear los datos: header: Object.keys(rows[0]).map((key) => ({ id: key, title: key })),

      header: [
        { id: 'ID', title: 'ID' },
        { id: 'Nombre', title: 'Nombre' },
        { id: 'Precio', title: 'Precio' },
        { id: 'Stock', title: 'Stock' },
        { id: 'Serial', title: 'Serial' },
        { id: 'DescripcionIA', title: 'Descripción IA' },
        { id: 'CategoriaIA', title: 'Categoría IA' },
        { id: 'Imagen', title: 'Imagen' },
        { id: 'Usuario', title: 'Usuario' },
        { id: 'Fecha', title: 'Fecha' },
      ],
    })

    //Mapeo de las cabeceras con las claves del array raws, gracias al esquelto montado antes con {id:key, title:key}
    await csvWriter.writeRecords(rows)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=inventario.csv')

    return res.download(filePath)
  } catch (error) {
    res.status(500).json({ error: 'Error generando reporte CSV' })
  }
})

export default reportesRouter

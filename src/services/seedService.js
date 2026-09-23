// Utilidad de desarrollo: crea categorías y productos de prueba en Firestore
// si las colecciones están vacías. Se invoca manualmente desde el Dashboard.
import { SEED_CATEGORIES, SEED_PRODUCTS } from "../data/seedData";
import { getAllCategories, createCategory } from "./categoryService";
import { getAllProducts, createProduct } from "./productService";

export async function seedDemoData() {
  const existingCategories = await getAllCategories();
  const existingProducts = await getAllProducts();

  if (existingCategories.length > 0 || existingProducts.length > 0) {
    throw new Error(
      "Ya existen datos en Firestore. Elimina las colecciones manualmente si quieres reiniciar."
    );
  }

  const categoryIdByName = {};
  for (const category of SEED_CATEGORIES) {
    const id = await createCategory(category);
    categoryIdByName[category.nombre] = id;
  }

  for (const product of SEED_PRODUCTS) {
    const { categoriaNombre, ...rest } = product;
    await createProduct({
      ...rest,
      categoriaId: categoryIdByName[categoriaNombre] || null,
    });
  }
}

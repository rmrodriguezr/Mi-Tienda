const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Orden en el que se validan (y en el que se lleva el foco al primer error).
export const CUSTOMER_FIELDS = ["name", "phone", "email", "department", "city", "address"];

export const EMPTY_CUSTOMER = {
  name: "",
  phone: "",
  email: "",
  department: "",
  city: "",
  address: "",
  notes: "",
};

export function validateCustomerField(field, value) {
  const text = (value || "").trim();
  if (!text) return "Este campo es obligatorio";
  if (field === "email" && !EMAIL_REGEX.test(text)) return "Ingresa un correo electrónico válido";
  if (field === "phone" && text.replace(/\D/g, "").length < 7) {
    return "Ingresa un número de teléfono válido";
  }
  return "";
}

// Devuelve un objeto { campo: mensaje } solo con los campos que tienen error.
export function validateCustomer(customer) {
  const errors = {};
  CUSTOMER_FIELDS.forEach((field) => {
    const message = validateCustomerField(field, customer[field]);
    if (message) errors[field] = message;
  });
  return errors;
}

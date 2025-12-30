const validateSignUpData=(req)=>{
    const {firstName,lastName,emailId,password}=req.body;

}
function getErrorMessage(err) {
  // Validation errors (schema rules like required, minLength, custom validate)
  if (err.name === "ValidationError") {
    // Collect all field-specific messages
    return Object.values(err.errors)
      .map(e => e.message)
      .join(", ");
  }

  // Duplicate key error (unique index violation)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return `Duplicate value for field "${field}": ${err.keyValue[field]}`;
  }

  // Cast errors (wrong type, e.g. string in Number field)
  if (err.name === "CastError") {
    return `Invalid value for ${err.path}: ${err.value}`;
  }

  // Fallback: use message if available
  return err.message || "Unknown error occurred";
}


module.exports={validateSignUpData, getErrorMessage};
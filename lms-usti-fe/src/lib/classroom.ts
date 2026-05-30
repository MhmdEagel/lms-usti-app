import { v4 as uuidv4 } from 'uuid'

const generateJoinCode = () => {
  const uuid = uuidv4().replace(/-/g, '')
  const shortCode = uuid.slice(0, 4).toUpperCase()
  return 'KLS-' + shortCode;
}

export default generateJoinCode;
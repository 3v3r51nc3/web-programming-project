// Frontend developer: Mehdi AGHAEI
export function getAgeFromBirthDate(birthDate, now = new Date()) {
  if (!birthDate) {
    return null
  }

  const dateOfBirth = new Date(birthDate)

  if (Number.isNaN(dateOfBirth.getTime())) {
    return null
  }

  let age = now.getFullYear() - dateOfBirth.getFullYear()
  const monthDifference = now.getMonth() - dateOfBirth.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && now.getDate() < dateOfBirth.getDate())) {
    age -= 1
  }

  return age >= 0 ? age : null
}

export function getAgeLevel(age) {
  if (typeof age !== 'number' || age < 0) {
    return ''
  }

  if (age > 70) {
    return 'old'
  }

  if (age < 26) {
    return 'young'
  }

  return 'mature'
}

export function getAgeLevelLabel(level) {
  if (level === 'young') {
    return 'Young'
  }

  if (level === 'old') {
    return 'Old'
  }

  if (level === 'mature') {
    return 'Mature'
  }

  return 'Unknown'
}

export function buildProfileMetaFromBirthDate(birthDate) {
  const age = getAgeFromBirthDate(birthDate)
  const ageLevel = getAgeLevel(age)

  if (!birthDate || age === null || !ageLevel) {
    return null
  }

  return {
    birthDate,
  }
}

export function enrichUserWithProfileMeta(user, profileMeta) {
  if (!user) {
    return null
  }

  const age = getAgeFromBirthDate(profileMeta?.birthDate)
  const ageLevel = getAgeLevel(age)

  return {
    ...user,
    age,
    ageLevel,
    ageLabel: getAgeLevelLabel(ageLevel),
    birthDate: profileMeta?.birthDate || '',
  }
}

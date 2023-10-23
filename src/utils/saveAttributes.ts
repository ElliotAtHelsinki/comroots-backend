export const saveAttributes = <E extends {}, I extends {}>(org: E & any, attrs: I) => {
  const keys = Object.keys(attrs)
  for (const key of keys) {
    const value = attrs[key as keyof I]
    if (typeof value != undefined && value != null) {
      org[key as keyof I] = value
    }
  }
}
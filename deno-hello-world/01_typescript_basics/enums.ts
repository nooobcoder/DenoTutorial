enum UserRole {
  ADMIN,
  USER,
}

function isAdmin(c: UserRole): boolean {
  if (c === UserRole.ADMIN) return true;
  else return false;
}

const role: UserRole = UserRole.ADMIN;
isAdmin(role);

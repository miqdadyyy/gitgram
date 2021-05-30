async function getTelegramIdFromGithubOrganization(firestoreCollection, organizationId) {
  const documents = await firestoreCollection.where('github_organizations', 'array-contains', organizationId + '').get();
  const id = [];
  if(documents.empty) return [];
  documents.forEach(document => {
    id.push(document.data().chat_id);
  })
  return id;
}

module.exports = {
  getTelegramIdFromGithubOrganization
}

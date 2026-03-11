import BoxSDK from 'box-node-sdk';
import { Readable } from 'stream';

let client = null;

function getClient() {
  if (client) return client;

  const privateKey = process.env.BOX_JWT_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const sdk = BoxSDK.getPreconfiguredInstance({
    boxAppSettings: {
      clientID: process.env.BOX_CLIENT_ID,
      clientSecret: process.env.BOX_CLIENT_SECRET,
      appAuth: {
        publicKeyID: process.env.BOX_PUBLIC_KEY_ID,
        privateKey,
        passphrase: process.env.BOX_PASSPHRASE,
      },
    },
    enterpriseID: process.env.BOX_ENTERPRISE_ID,
  });

  client = sdk.getAppAuthClient('enterprise');
  return client;
}

export async function listFolders(folderId = '0') {
  const box = getClient();
  const items = await box.folders.getItems(folderId, {
    fields: 'id,name,type',
    limit: 1000,
  });
  return items.entries
    .filter((i) => i.type === 'folder')
    .map((f) => ({ id: f.id, name: f.name }));
}

export async function uploadFile(folderId, fileName, buffer) {
  const box = getClient();
  const stream = Readable.from(buffer);
  const result = await box.files.uploadFile(folderId, fileName, stream);
  return result.entries[0];
}

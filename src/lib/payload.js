import { PayloadUtils } from '@ucd-lib/cork-app-utils';

const ID_ORDER = ['action', 'icons', 'q', 'limit', 'iconsets', 'excludeIconsets'];

let inst = new PayloadUtils({idParts: ID_ORDER});

export default inst;

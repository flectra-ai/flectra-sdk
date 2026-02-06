export const RobotIdAbi = [
  // Read functions
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getRobot',
    outputs: [
      { name: 'operator', type: 'address' },
      { name: 'hardwareHash', type: 'bytes32' },
      { name: 'hardwareAddress', type: 'address' },
      { name: 'registeredAt', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'hardwareHash', type: 'bytes32' }],
    name: 'getTokenIdByHardwareHash',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'operator', type: 'address' }],
    name: 'getOperatorRobots',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'registrationNonce',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: 'hardwareHash', type: 'bytes32' },
      { name: 'hardwareAddress', type: 'address' },
      { name: 'hardwareAttestation', type: 'bytes' },
    ],
    name: 'registerRobot',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'deactivateRobot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'reactivateRobot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'operator', type: 'address' },
      { indexed: false, name: 'hardwareHash', type: 'bytes32' },
    ],
    name: 'RobotRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'tokenId', type: 'uint256' }],
    name: 'RobotDeactivated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'tokenId', type: 'uint256' }],
    name: 'RobotReactivated',
    type: 'event',
  },
] as const

export const AttestationRegistryAbi = [
  // Read functions
  {
    inputs: [{ name: 'attestationId', type: 'uint256' }],
    name: 'getAttestation',
    outputs: [
      { name: 'robotId', type: 'uint256' },
      { name: 'attestationHash', type: 'bytes32' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'isBatch', type: 'bool' },
      { name: 'count', type: 'uint32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'robotId', type: 'uint256' }],
    name: 'getRobotAttestationCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'robotId', type: 'uint256' }],
    name: 'getLastBatchTimestamp',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAttestations',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'merkleRoot', type: 'bytes32' },
      { name: 'proof', type: 'bytes32[]' },
      { name: 'leaf', type: 'bytes32' },
    ],
    name: 'verifyAttestation',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: 'robotId', type: 'uint256' },
      { name: 'dataHash', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    name: 'submitAttestation',
    outputs: [{ name: 'attestationId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'robotId', type: 'uint256' },
      { name: 'merkleRoot', type: 'bytes32' },
      { name: 'count', type: 'uint32' },
      { name: 'signature', type: 'bytes' },
    ],
    name: 'submitBatch',
    outputs: [{ name: 'attestationId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'attestationId', type: 'uint256' },
      { indexed: true, name: 'robotId', type: 'uint256' },
      { indexed: false, name: 'dataHash', type: 'bytes32' },
    ],
    name: 'AttestationSubmitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'attestationId', type: 'uint256' },
      { indexed: true, name: 'robotId', type: 'uint256' },
      { indexed: false, name: 'merkleRoot', type: 'bytes32' },
      { indexed: false, name: 'count', type: 'uint32' },
    ],
    name: 'BatchSubmitted',
    type: 'event',
  },
] as const

export const FlectraStakingAbi = [
  // Read functions
  {
    inputs: [{ name: 'robotId', type: 'uint256' }],
    name: 'getStake',
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'lockedAmount', type: 'uint256' },
      { name: 'unlockTime', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'robotId', type: 'uint256' }],
    name: 'getEffectiveStake',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minStake',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unstakeLockPeriod',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: 'robotId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'robotId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'initiateUnstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'robotId', type: 'uint256' }],
    name: 'completeUnstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'robotId', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'Staked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'robotId', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'unlockTime', type: 'uint256' },
    ],
    name: 'UnstakeInitiated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'robotId', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'UnstakeCompleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'robotId', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'reason', type: 'string' },
    ],
    name: 'Slashed',
    type: 'event',
  },
] as const

export const ERC20Abi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

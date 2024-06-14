const BATCH_TRANSFER_ABI = [
    'function airdropCoin(address[] memory _to, uint256[] memory _amount) public payable',
    'function airdropToken(address _token, address[] memory _to, uint256[] memory _amount) public'
]

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint amount)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount)',
    // decimals
    'function decimals() view returns (uint8)',
    // symbol
    'function symbol() view returns (string)',
    // name
    'function name() view returns (string)',
    // total supply
    'function totalSupply() view returns (uint256)',
    // allowance
    'function allowance(address owner, address spender) view returns (uint256)',
    // approve
    'function approve(address spender, uint256 amount) returns (bool)',
    // premit
    'function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s)',
];



const ABI_UNISWAP_V2_ROUTER = [
    'function WETH() external pure returns (address)',
    //swapETHForExactTokens
    'function swapETHForExactTokens( \
        uint amountOut, \
        address[] calldata path, \
        address to, \
        uint deadline \
    ) external payable returns (uint[] memory amounts)',

    //swapExactETHForTokens
    'function swapExactETHForTokens( \
        uint amountOutMin, \
        address[] calldata path, \
        address to, \
        uint deadline \
    ) external payable returns (uint[] memory amounts)',

    //swapTokensForExactETH
    'function swapTokensForExactETH( \
        uint amountOut, \
        uint amountInMax, \
        address[] calldata path, \
        address to, \
        uint deadline \
    ) external returns (uint[] memory amounts)',

    //swapExactTokensForETH
    'function swapExactTokensForETH( \
        uint amountIn, \
        uint amountOutMin, \
        address[] calldata path, \
        address to, \
        uint deadline \
    ) external returns (uint[] memory amounts)',

    //swapExactTokensForTokens
    'function swapExactTokensForTokens( \
        uint amountIn, \
        uint amountOutMin, \
        address[] calldata path, \
        address to, \
        uint deadline \
    ) external returns (uint[] memory amounts)',

    //swapTokensForExactTokens
    'function swapTokensForExactTokens( \
        uint amountOut, \
        uint amountInMax, \
        address[] calldata path, \
        address to, \
        uint deadline \
    ) external returns (uint[] memory amounts)',

    'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
    'function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)'
]



const ABI_IV3SwapRouter = [
    'function WETH9() external view returns (address)',

    'struct ExactInputSingleParams {\
        address tokenIn;\
        address tokenOut;\
        uint24 fee;\
        address recipient;\
        uint256 amountIn;\
        uint256 amountOutMinimum;\
        uint160 sqrtPriceLimitX96;\
    }',
    'function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut)',

    'struct ExactOutputSingleParams { \
        address tokenIn; \
        address tokenOut; \
        uint24 fee; \
        address recipient; \
        uint256 amountOut; \
        uint256 amountInMaximum; \
        uint160 sqrtPriceLimitX96; \
    }',
    'function exactOutputSingle(ExactOutputSingleParams calldata params) external payable returns (uint256 amountIn)',
]


const ERC721_ABI = [
    // symbol
    'function symbol() external view returns (string)',
    'function transferFrom(address from, address to, uint256 tokenId) external',
    'function ownerOf(uint256 tokenId) external view returns (address owner)',
    'function balanceOf(address owner) external view returns (uint256 balance)',
    // tokenURI
    'function tokenURI(uint256 tokenId) external view returns (string)',
    // getApproved
    'function getApproved(uint256 tokenId) external view returns (address)',
    // token index
    'function tokenByIndex(uint256 index) external view returns (uint256)',
    // total supply
    'function totalSupply() external view returns (uint256)',
    // tokenOfOwnerByIndex
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
    // approve
    'function approve(address to, uint256 tokenId) external',
    // setApprovalForAll
    'function setApprovalForAll(address operator, bool _approved) external',
    // isApprovedForAll
    'function isApprovedForAll(address owner, address operator) external view returns (bool)',
    // safeTransferFrom
    'function safeTransferFrom(address from, address to, uint256 tokenId) external',
];

export {
    ERC20_ABI,
    ERC721_ABI,
    BATCH_TRANSFER_ABI,
    ABI_UNISWAP_V2_ROUTER,
    ABI_IV3SwapRouter,
    ZERO_ADDRESS
}
const { expectRevert } = require('@openzeppelin/test-helpers');
const EmtiaToken = artifacts.require('EmtiaToken');

contract('EmtiaToken', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.emtia = await EmtiaToken.new({ from: alice });
    });

    it('should have correct name and symbol and decimal', async () => {
        const name = await this.emtia.name();
        const symbol = await this.emtia.symbol();
        const decimals = await this.emtia.decimals();
        assert.equal(name.valueOf(), 'Emtia Token');
        assert.equal(symbol.valueOf(), 'EMTIA');
        assert.equal(decimals.valueOf(), '18');
    });

    it('should only allow owner to mint token', async () => {
        await this.emtia.mint(alice, '100', { from: alice });
        await this.emtia.mint(bob, '1000', { from: alice });
        await expectRevert(
            this.emtia.mint(carol, '1000', { from: bob }),
            'Ownable: caller is not the owner',
        );
        const totalSupply = await this.emtia.totalSupply();
        const aliceBal = await this.emtia.balanceOf(alice);
        const bobBal = await this.emtia.balanceOf(bob);
        const carolBal = await this.emtia.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '100');
        assert.equal(bobBal.valueOf(), '1000');
        assert.equal(carolBal.valueOf(), '0');
    });

    it('should supply token transfers properly', async () => {
        await this.emtia.mint(alice, '100', { from: alice });
        await this.emtia.mint(bob, '1000', { from: alice });
        await this.emtia.transfer(carol, '10', { from: alice });
        await this.emtia.transfer(carol, '100', { from: bob });
        const totalSupply = await this.emtia.totalSupply();
        const aliceBal = await this.emtia.balanceOf(alice);
        const bobBal = await this.emtia.balanceOf(bob);
        const carolBal = await this.emtia.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '90');
        assert.equal(bobBal.valueOf(), '900');
        assert.equal(carolBal.valueOf(), '110');
    });

    it('should fail if you try to do bad transfers', async () => {
        await this.emtia.mint(alice, '100', { from: alice });
        await expectRevert(
            this.emtia.transfer(carol, '110', { from: alice }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.emtia.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });
  });

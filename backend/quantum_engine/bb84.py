import random


# ==================================================
# BB84 Quantum Key Distribution
# ==================================================

def simulate_bb84(
    bits: int = 8,
    eavesdropper: bool = False,
):
    """
    Educational BB84 Quantum Key Distribution simulation.

    Alice:
        - Generates random bits.
        - Chooses random Z/X bases.
        - Encodes the bits.

    Eve:
        - Optionally intercepts the transmitted states.
        - Chooses random measurement bases.
        - Re-encodes the measured states.

    Bob:
        - Chooses random measurement bases.
        - Measures the received states.

    Alice and Bob:
        - Compare bases.
        - Keep matching-basis measurements.
        - Reveal a sample of the sifted bits.
        - Calculate QBER.
        - Keep the remaining bits as the secret key
          when the error rate is below the threshold.
    """

    # --------------------------------------------------
    # Validation
    # --------------------------------------------------

    if bits < 4:
        raise ValueError(
            "BB84 requires at least 4 bits."
        )

    if bits > 64:
        raise ValueError(
            "BB84 supports at most 64 bits."
        )


    # --------------------------------------------------
    # BB84 security threshold
    # --------------------------------------------------

    qber_threshold = 0.25


    # --------------------------------------------------
    # Alice generates random bits
    # --------------------------------------------------

    alice_bits = [
        random.randint(0, 1)
        for _ in range(bits)
    ]


    # --------------------------------------------------
    # Alice chooses random bases
    # --------------------------------------------------

    alice_bases = [
        random.choice(["Z", "X"])
        for _ in range(bits)
    ]


    # --------------------------------------------------
    # Bob chooses random bases
    # --------------------------------------------------

    bob_bases = [
        random.choice(["Z", "X"])
        for _ in range(bits)
    ]


    # --------------------------------------------------
    # Eve chooses bases
    # --------------------------------------------------

    if eavesdropper:

        eve_bases = [
            random.choice(["Z", "X"])
            for _ in range(bits)
        ]

    else:

        eve_bases = [
            None
            for _ in range(bits)
        ]


    # --------------------------------------------------
    # Quantum transmission
    # --------------------------------------------------

    bob_bits = []

    for index in range(bits):

        original_bit = alice_bits[index]

        alice_basis = alice_bases[index]
        bob_basis = bob_bases[index]


        # ----------------------------------------------
        # No Eve
        # ----------------------------------------------

        if not eavesdropper:

            if alice_basis == bob_basis:

                measured_bit = original_bit

            else:

                measured_bit = random.randint(
                    0,
                    1,
                )


        # ----------------------------------------------
        # Eve intercepts
        # ----------------------------------------------

        else:

            eve_basis = eve_bases[index]


            if eve_basis == alice_basis:

                eve_bit = original_bit

            else:

                eve_bit = random.randint(
                    0,
                    1,
                )


            if bob_basis == eve_basis:

                measured_bit = eve_bit

            else:

                measured_bit = random.randint(
                    0,
                    1,
                )


        bob_bits.append(
            measured_bit
        )


    # --------------------------------------------------
    # Sifting
    # --------------------------------------------------

    matching_positions = []

    sifted_alice_key = []

    sifted_bob_key = []


    for index in range(bits):

        if (
            alice_bases[index]
            == bob_bases[index]
        ):

            matching_positions.append(index)

            sifted_alice_key.append(
                alice_bits[index]
            )

            sifted_bob_key.append(
                bob_bits[index]
            )


    # --------------------------------------------------
    # Determine test sample
    # --------------------------------------------------

    sifted_length = len(
        sifted_alice_key
    )


    if sifted_length >= 4:

        test_size = max(
            1,
            sifted_length // 4,
        )

    else:

        test_size = 0


    test_indices = list(
        range(sifted_length)
    )


    random.shuffle(
        test_indices
    )


    test_indices = test_indices[
        :test_size
    ]


    test_indices_set = set(
        test_indices
    )


    # --------------------------------------------------
    # Compare test bits
    # --------------------------------------------------

    test_alice_bits = []

    test_bob_bits = []

    test_errors = 0


    for index in test_indices:

        alice_bit = (
            sifted_alice_key[index]
        )

        bob_bit = (
            sifted_bob_key[index]
        )


        test_alice_bits.append(
            alice_bit
        )

        test_bob_bits.append(
            bob_bit
        )


        if alice_bit != bob_bit:

            test_errors += 1


    # --------------------------------------------------
    # Calculate QBER
    # --------------------------------------------------

    if test_size > 0:

        qber = (
            test_errors
            / test_size
        )

    else:

        qber = 0.0


    # --------------------------------------------------
    # Secret key
    # --------------------------------------------------

    secret_alice_key = []

    secret_bob_key = []


    for index in range(
        sifted_length
    ):

        if index not in test_indices_set:

            secret_alice_key.append(
                sifted_alice_key[index]
            )

            secret_bob_key.append(
                sifted_bob_key[index]
            )


    # --------------------------------------------------
    # Security decision
    # --------------------------------------------------

    secure = (
        sifted_length > 0
        and qber < qber_threshold
    )


    eve_detected = (
        eavesdropper
        and qber >= qber_threshold
    )


    if secure:

        message = (
            "The measured QBER is below the "
            "security threshold. Alice and Bob "
            "can retain the remaining bits as "
            "a candidate secret key."
        )

    elif eve_detected:

        message = (
            "The measured QBER is at or above "
            "the security threshold. The quantum "
            "channel appears disturbed, so the "
            "key should be rejected."
        )

    elif test_size == 0:

        message = (
            "Not enough matching bases were "
            "available to perform a meaningful "
            "security test."
        )

    else:

        message = (
            "The measured error rate is too high. "
            "Alice and Bob should reject this key."
        )


    # --------------------------------------------------
    # Transmission details
    # --------------------------------------------------

    transmission = []


    for index in range(bits):

        basis_match = (
            alice_bases[index]
            == bob_bases[index]
        )


        sifted_index = None


        if basis_match:

            sifted_index = (
                matching_positions.index(index)
            )


        is_test_bit = (
            sifted_index is not None
            and sifted_index in test_indices_set
        )


        error = (
            basis_match
            and alice_bits[index]
            != bob_bits[index]
        )


        transmission.append(
            {
                "position": index,
                "alice_bit": alice_bits[index],
                "alice_basis": alice_bases[index],
                "eve_basis": eve_bases[index],
                "bob_basis": bob_bases[index],
                "bob_bit": bob_bits[index],
                "basis_match": basis_match,
                "kept": basis_match,
                "test_bit": is_test_bit,
                "error": error,
            }
        )


    # --------------------------------------------------
    # Return complete result
    # --------------------------------------------------

    return {
        "algorithm": "BB84",

        "bits": bits,

        "eavesdropper": eavesdropper,

        "qber_threshold": qber_threshold,

        "alice_bits": alice_bits,

        "alice_bases": alice_bases,

        "eve_bases": eve_bases,

        "bob_bases": bob_bases,

        "bob_bits": bob_bits,

        "matching_positions": matching_positions,

        "sifted_alice_key": sifted_alice_key,

        "sifted_bob_key": sifted_bob_key,

        "sifted_key_length": sifted_length,

        "test_alice_bits": test_alice_bits,

        "test_bob_bits": test_bob_bits,

        "test_key_length": test_size,

        "test_errors": test_errors,

        "qber": qber,

        "error_rate": qber,

        "secret_alice_key": secret_alice_key,

        "secret_bob_key": secret_bob_key,

        "secret_key_length": len(
            secret_alice_key
        ),

        "mismatches": test_errors,

        "secure": secure,

        "eve_detected": eve_detected,

        "message": message,

        "transmission": transmission,
    }
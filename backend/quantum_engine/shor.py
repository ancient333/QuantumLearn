import math
import random


def gcd(a: int, b: int) -> int:
    return math.gcd(a, b)


def is_prime(number: int) -> bool:

    if number < 2:
        return False

    if number == 2:
        return True

    if number % 2 == 0:
        return False

    divisor = 3

    while divisor * divisor <= number:

        if number % divisor == 0:
            return False

        divisor += 2

    return True


def modular_power(
    base: int,
    exponent: int,
    modulus: int,
) -> int:

    return pow(
        base,
        exponent,
        modulus,
    )


def find_period(
    base: int,
    number: int,
) -> int | None:

    if gcd(base, number) != 1:
        return None

    value = 1

    for period in range(
        1,
        number * number,
    ):

        value = (
            value * base
        ) % number

        if value == 1:
            return period

    return None


def find_factors_from_period(
    base: int,
    number: int,
    period: int,
) -> tuple[int, int] | None:

    if period % 2 != 0:
        return None

    value = modular_power(
        base,
        period // 2,
        number,
    )

    if value == number - 1:
        return None

    factor1 = gcd(
        value - 1,
        number,
    )

    factor2 = gcd(
        value + 1,
        number,
    )

    if (
        factor1 == 1
        or factor1 == number
        or factor2 == 1
        or factor2 == number
    ):
        return None

    return (
        factor1,
        factor2,
    )


def choose_coprime_base(
    number: int,
) -> int | None:

    candidates = list(
        range(
            2,
            number,
        )
    )

    random.shuffle(candidates)

    for base in candidates:

        if gcd(
            base,
            number,
        ) == 1:

            return base

    return None


def factor_number(
    number: int,
    base: int | None = None,
) -> dict:

    if number < 4:
        raise ValueError(
            "Number must be at least 4."
        )

    if number > 1000:
        raise ValueError(
            "For this educational simulator, "
            "use a number no greater than 1000."
        )

    if is_prime(number):

        return {
            "success": True,
            "number": number,
            "base": None,
            "period": None,
            "factors": None,
            "is_prime": True,
            "message": (
                f"{number} is prime, so it has no "
                "non-trivial integer factors."
            ),
        }

    if base is None:

        base = choose_coprime_base(
            number
        )

    if base is None:

        raise ValueError(
            "Could not find a suitable base."
        )

    if not 1 < base < number:

        raise ValueError(
            "Base must satisfy 1 < base < number."
        )

    common_divisor = gcd(
        base,
        number,
    )

    if common_divisor != 1:

        return {
            "success": True,
            "number": number,
            "base": base,
            "period": None,
            "factors": [
                common_divisor,
                number // common_divisor,
            ],
            "is_prime": False,
            "message": (
                "A non-trivial factor was found "
                "before period finding."
            ),
        }

    period = find_period(
        base,
        number,
    )

    if period is None:

        raise ValueError(
            "Could not find a period for the "
            "selected base."
        )

    factors = find_factors_from_period(
        base,
        number,
        period,
    )

    if factors is None:

        for alternative_base in range(
            2,
            number,
        ):

            if alternative_base == base:
                continue

            if gcd(
                alternative_base,
                number,
            ) != 1:
                continue

            alternative_period = find_period(
                alternative_base,
                number,
            )

            if alternative_period is None:
                continue

            alternative_factors = (
                find_factors_from_period(
                    alternative_base,
                    number,
                    alternative_period,
                )
            )

            if alternative_factors is not None:

                base = alternative_base
                period = alternative_period
                factors = alternative_factors

                break

    if factors is None:

        return {
            "success": False,
            "number": number,
            "base": base,
            "period": period,
            "factors": None,
            "is_prime": False,
            "message": (
                "The selected period did not produce "
                "non-trivial factors. Try another base."
            ),
        }

    factor1, factor2 = factors

    return {
        "success": True,
        "number": number,
        "base": base,
        "period": period,
        "factors": [
            factor1,
            factor2,
        ],
        "is_prime": False,
        "message": (
            f"Shor's algorithm found factors "
            f"{factor1} × {factor2} = {number}."
        ),
    }


def build_shor_steps(
    number: int,
    base: int,
    period: int | None,
    factors: list[int] | None,
) -> list[dict]:

    steps = []

    steps.append(
        {
            "step": 1,
            "title": "Choose the number",
            "description": (
                f"We want to factor N = {number}."
            ),
        }
    )

    steps.append(
        {
            "step": 2,
            "title": "Choose a base",
            "description": (
                f"Choose a value a = {base} "
                f"such that gcd({base}, {number}) = 1."
            ),
        }
    )

    steps.append(
        {
            "step": 3,
            "title": "Find the period",
            "description": (
                f"Find the smallest r such that "
                f"{base}^r mod {number} = 1."
            ),
            "period": period,
        }
    )

    if (
        period is not None
        and period % 2 == 0
    ):

        steps.append(
            {
                "step": 4,
                "title": "Use the period",
                "description": (
                    f"The period r = {period} is even, "
                    f"so we can use r/2 = "
                    f"{period // 2}."
                ),
            }
        )

    else:

        steps.append(
            {
                "step": 4,
                "title": "Try another period",
                "description": (
                    "The period is not suitable for "
                    "factor extraction, so another "
                    "base would be required."
                ),
            }
        )

    if factors is not None:

        steps.append(
            {
                "step": 5,
                "title": "Extract the factors",
                "description": (
                    f"The resulting factors are "
                    f"{factors[0]} and {factors[1]}."
                ),
            }
        )

    else:

        steps.append(
            {
                "step": 5,
                "title": "No factors found",
                "description": (
                    "This attempt did not produce "
                    "non-trivial factors."
                ),
            }
        )

    return steps

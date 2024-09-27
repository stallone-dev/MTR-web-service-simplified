/*
    This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import {
    MtrWSBaseURL,
    type MtrWSType,
} from "@stallone-dev/types-mtr-web-service";
import { generateTemporaryToken } from "../../token-generator-for-tests.ts";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";

import { consultarAcondicionamentoParaEstadoFisico } from "~route/consult/consultar-acondicionamento-para-estado-fisico.ts";

/*
    Testes para validação da API de consulta de acondicionamentos por cod IBAMA
*/

describe("LISTAR-ACONDICIONAMENTOS-PARA-ESTADO-FISICO - Tests", () => {
    let _TOKEN: MtrWSType.auth.token;
    let _BASE_URL: MtrWSBaseURL;
    let _COD_ESTADO_FISICO: number;

    beforeAll(async () => {
        const _env = Deno.env.toObject();
        const _base = (_env.TEST_BASE_API ?? "SINIR") as "SINIR" | "SIGOR";

        _BASE_URL = MtrWSBaseURL[_base];
        _TOKEN = await generateTemporaryToken(_BASE_URL);
        _COD_ESTADO_FISICO = 1;
    });

    afterAll(() => {
        _TOKEN = "Bearer _";
    });

    describe("Expected scenario", () => {
        it("Simple get result", async () => {
            const consult = new consultarAcondicionamentoParaEstadoFisico({
                codEstadoFisico: _COD_ESTADO_FISICO,
                authToken: _TOKEN,
                API_BASE_URL: _BASE_URL,
            });
            const result = await consult.getResult();

            expect(result[1]).toMatchObject({
                "tiaCodigo": 4,
                "tiaDescricao": "CAÇAMBA ABERTA",
            });
        });
    });

    describe("Invalid scenarios", () => {
        it("Token", async () => {
            const token = "Bearer _";
            const consult = new consultarAcondicionamentoParaEstadoFisico({
                codEstadoFisico: _COD_ESTADO_FISICO,
                authToken: token,
                API_BASE_URL: _BASE_URL,
            });
            const result = consult.getResult();

            await expect(result).rejects.toThrow();
        });

        it("Cod IBAMA - invalid", async () => {
            const consult = new consultarAcondicionamentoParaEstadoFisico({
                codEstadoFisico: 0,
                authToken: _TOKEN,
                API_BASE_URL: _BASE_URL,
            });
            const result = await consult.getResult();

            expect(result).toEqual([]);
        });

        it("Base URL", async () => {
            const base_url = Deno.env.get("TEST_BASE_API") === "SINIR"
                ? MtrWSBaseURL.SIGOR
                : MtrWSBaseURL.SINIR;

            const consult = new consultarAcondicionamentoParaEstadoFisico({
                codEstadoFisico: _COD_ESTADO_FISICO,
                authToken: _TOKEN,
                API_BASE_URL: base_url,
            });
            const result = consult.getResult();

            const regex = new RegExp(/Unexpected end of JSON input/);
            await expect(result).rejects.toThrow(regex);
        });
    });
});
